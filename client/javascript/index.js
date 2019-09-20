import { config } from './config.js'
(function() {
    function main() {
        function bugReport() {
            window.location = GITHUB_ISSUE_URL;
        }
        document.getElementById("bug_report").addEventListener("click", )
        document.getElementById("shorten").addEventListener("click", async function() {
            let shorten_button = document.getElementById("shorten");
            shorten_button.innerText = "生成中";
            shorten_button.setAttribute("disabled", "true");
            shorten_button.classList.replace("btn-outline-success", "btn-info");

            // from https://stackoverflow.com/a/49283749/4275047
            const isUrl = string => {
                try {
                    return Boolean(new URL(string));
                } catch (e) {
                    return false;
                }
            };
            let url = document.getElementById("url").value;
            if (!isUrl(url)) {
                shorten_button.classList.replace("btn-info", "btn-outline-success");
                shorten_button.innerText = "縮個！";
                shorten_button.removeAttribute("disabled");
                let isBug = await swal({
                    title: "格式錯誤",
                    text: "很抱歉，我們目前僅能縮短一個完整的網址",
                    icon: "error",
                    buttons: [{
                            text: "Bug回報",
                            value: true
                        },
                        {
                            text: "OK",
                            value: false
                        }
                    ]
                });
                if (isBug) bugReport();
                return;
            }
            try {
                const result = await axios(config.API_URL, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
                    },
                    data: { "url": url }
                }).then(response => response.data);
                if (result.error) {
                    shorten_button.classList.replace("btn-info", "btn-outline-success");
                    shorten_button.innerText = "縮個！";
                    shorten_button.removeAttribute("disabled");
                    swal("錯誤", result.error, "error");
                } else if (result.success) {
                    let clipboard = new ClipboardJS("#copy");
                    let shorten_url = document.getElementById("shorten_url");
                    shorten_url.value = config.BASE_URL + result.entry;
                    let original_url = document.getElementById("original_url");
                    original_url.href = url;
                    original_url.innerText = url;
                    let qr_code = document.getElementById("qr_code");
                    qr_code.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chld=L|1&chl=${encodeURIComponent(shorten_url.value)}`;
                    let modal = document.getElementById("modal");
                    shorten_button.classList.replace("btn-info", "btn-outline-success");
                    shorten_button.innerText = "縮個！";
                    shorten_button.removeAttribute("disabled");
                    await swal({
                        title: "成功建立短網址",
                        content: modal,
                        closeOnClickOutside: false
                    });
                    document.getElementById("url").value = "";
                    clipboard.destroy();
                }
            } catch (e) {
                shorten_button.classList.replace("btn-info", "btn-outline-success");
                shorten_button.innerText = "縮個！";
                shorten_button.removeAttribute("disabled");
                let isBug = await swal({
                    title: "未知錯誤",
                    text: "無法建立短網址，請確認網路連線是否正常",
                    icon: "error",
                    buttons: [{
                            text: "Bug回報",
                            value: true
                        },
                        {
                            text: "OK",
                            value: false
                        }
                    ]
                });
                if (isBug) bugReport();
            }
        });
    }
    if (document.readyState != "loading") {
        main();
    } else {
        document.addEventListener("DOMContentLoaded", main);
    }
})();
