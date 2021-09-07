const Firestore = require('@google-cloud/firestore');
const secureRandom = require('secure-random');
const config = require('./config.json');

const db = new Firestore({
    projectId: config.GCP_PROJECT_ID,
    keyFilename: config.GCP_KEY_FILENAME,
});

function randomString(base, length) {
    // base.length should <= 255
    const bytes = secureRandom(length);
    return bytes.map(x=>base[Math.floor(x/255 * base.length)]).join('');
}

async function createShortenUrl(req, res) {
    if(typeof req.body.url === 'undefined') {
        return res.status(510).send({'error': 'url field required'});
    }
    
    // from https://stackoverflow.com/a/49283749/4275047
    const isUrl = url => {
        try { return Boolean(new URL(url)); }
        catch(e){ return false; }
    }    
    if (!isUrl(req.body.url)) {
        return res.status(510).send({'error': 'invalid url'});
    }

    const urlsCollectRef = db.collection('urls');
    for (let tries = 0; tries < config.MAX_TRIES; ++tries) {
        const entry = randomString(config.URL_BASE,
                                 config.URL_MIN_LENGTH + Math.floor(tries / 8));
        const docRef = urlsCollectRef.doc(entry);
        try {
            await docRef.create({
                "url": req.body.url,
                "click": 0,
                "generate_date": Firestore.Timestamp.now()
            });
            return res.status(201).send({'success': true, 'entry': entry});
        } catch(e) {
            console.log(e);
        }
    }
    return res.status(500).send({'error': 'unknown error with firebase'});
}

async function redirectShortenUrl(req, res) {
    let entry = req.path.slice(1);

    if (entry == '') {
        res.redirect(config.HOST_ADDR);
    } else {
        const urlDocRef = db.collection('urls').doc(entry);
        return db.runTransaction(async (t) => {
            try {
                const urlDoc = await t.get(urlDocRef);
                if (!urlDoc.exists) {
                    return res.redirect(`${config.HOST_ADDR}/404`);
                }
                await t.update(urlDocRef, {click: urlDoc.data().click + 1});
                return res.redirect(urlDoc.data().url);
            } catch(e) {
                console.log(e);
                return res.redirect(`${config.HOST_ADDR}/unknown`);
            }
        });
    }

}

exports.handler = async (req, res) => {

    res.set('Access-Control-Allow-Origin', config.HOST_ADDR);
    res.set('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');

    if (req.method == 'POST') {
        return await createShortenUrl(req, res);
    }
    if (req.method == 'GET' || req.method == 'HEAD') {
        return await redirectShortenUrl(req, res);
    }

    res.status(405).end();
};
