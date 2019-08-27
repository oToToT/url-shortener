const Firestore = require('@google-cloud/firestore');
const config = require('./config.json');

const db = new Firestore({
    "projectId": config.gcp_projectId,
    "keyFilename": config.gcp_keyFilename,
});

async function generate_entry() {
    let entry = "";
    for ( let i = 0; i < config.url_min_length; ++i ) {
        // not cryptographically-secure
        entry += config.url_base[Math.floor(Math.random()*config.url_base.length)];
    }
    const urlsCollectRef = db.collection('urls');
    let query = urlsCollectRef.doc(entry);
    while ( true ) {
        const doc = await query.get();
        if ( !doc.exists ) break;
        entry += entry += config.url_base[Math.floor(Math.random()*config.url_base.length)];
        query = urls.doc(entry);
    }
    return entry;
}

async function create_shorten_url(req, res) {
    if(typeof req.body.url === 'undefined') {
        return res.status(510).send({'error': 'url field required'});
    }
    // from https://stackoverflow.com/a/49283749/4275047
    const isUrl = string => {
        try { return Boolean(new URL(string)); }
        catch(e){ return false; }
    }    
    if ( !isUrl(req.body.url) ) {
        return res.status(510).send({'error': 'not a valid url'});
    }
    const entry = await generate_entry();
    const urlsCollectRef = db.collection('urls');
    try {
        await urlsCollectRef.doc(entry).set({
            "url": req.body.url,
            "click": 0,
            "generate_date": Firestore.Timestamp.now()
        });
    } catch( e ) {
        console.log(e);
        res.status(500).send({'error': 'unknown error about firebase'});
    }
    res.status(201).send({'success': true, 'entry': entry});
}

async function redirect_shorten_url(req, res) {
    let entry = req.path.slice(1);

    if (entry == '') {
        res.redirect(config.host_addr);
    } else {
        const urlDocRef = db.collection('urls').doc(entry);
        try {
            const urlDoc = await urlDocRef.get()
            if (!urlDoc.exists) {
                return res.redirect(`${config.host_addr}/404?${entry}`);
            }
            await urlDocRef.update({'click':urlDoc.get('click')+1});
            return res.redirect(await urlDoc.get('url'));
        } catch(e) {
            console.log(e);
            res.redirect(config.host_addr+'/unknown_error.html');
        }
    }

}

exports.handler = async (req, res) => {

    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET, POST, HEAD')

    if (req.method == 'POST') {
        return await create_shorten_url(req, res);
    }
    if (req.method == 'GET' || req.method == 'HEAD') {
        return await redirect_shorten_url(req, res);
    }
    res.status(405).end();
};
