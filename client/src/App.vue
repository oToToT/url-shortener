<template lang="pug">
.page-shell#index
  NavBar
  main.inner(role='main')
    h1.slogan 讓網路世界更簡單！
    p.lead-text
      | 網址太長很難記？
      br
      | 想要一個不追蹤使用者的縮網址服務？
      br
      | 來試試
      a(:href="baseUrl") Dve.Tw
      | 吧，一個極簡的縮網址服務
    .url-form
      input.url-input(type='text', placeholder='https://ototot.tw/', v-model="url")
      button.action-button(:disabled="isGenerating", :class='isGenerating ? "is-loading" : "is-ready"', @click='generateShortenUrl') {{ isGenerating ? '生成中' : '縮個！' }}
  Footer
</template>

<script>
import Footer from './components/Footer.vue';
import NavBar from './components/NavBar.vue';
import Config from './Config.js';
import axios from 'axios';
import Swal from 'sweetalert2';
import ClipboardJS from 'clipboard';
import QRCode from 'qrcode';


export default {
  components: {
    Footer,
    NavBar,
  },
  data() {
    return {
      baseUrl: Config.BASE_URL,
      isGenerating: false,
      url: '',
    }
  },
  methods: {
    isUrl(url) {
      try {
        return Boolean(new URL(url));
      } catch (e) {
        return false;
      }
    },
    async _generateShortenUrl() {
      if (!this.isUrl(this.url)) {
        const isBug = await Swal.fire({
          icon: "error",
          title: "格式錯誤",
          text: "很抱歉，我們目前僅能縮短一個完整的網址",
          showConfirmButton: true,
          showDenyButton: true,
          confirmButtonText: "OK",
          denyButtonText: "Bug回報",
          customClass: {
            confirmButton: 'swal-confirm-button',
            denyButton: 'swal-deny-button',
          },
          buttonsStyling: false,
        });
        if (isBug.isDenied) {
          Config.reportBug();
        }
        return;
      }

      try {
        const result = await axios(Config.API_URL, {
          method: "POST",
          headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
          },
          data: "url=" + encodeURIComponent(this.url)
        }).then(response => response.data);

        if (result.error) {
          Swal.fire("錯誤", result.error, "error");
          return;
        }

        const originalUrl = this.url;
        const shortenUrl = Config.BASE_URL + result.entry;
        const encodedShortenUrl = encodeURIComponent(shortenUrl);

        let clipboard = null;

        await Swal.fire({
          title: '成功建立短網址',
          allowOutsideClick: false,
          customClass: {
            title: 'shorten-url-result-title',
            actions: 'shorten-url-result-actions',
            confirmButton: 'swal-confirm-button',
          },
          buttonsStyling: false,
          html: `
          <div class="shorten-url-result-html">
            <div class="swal-input-group">
              <input class="swal-input" type="text" readonly id="shorten-url">
              <button class="swal-copy-button" id="copy-button">複製！</button>
            </div>
            <div class="qr-wrapper">
              <canvas width="200" height="200" id="qr-code"></canvas>
            </div>
            <p class="original-url-text">
              原網址：
              <a id="original-url"></a>
            </p>
          </div>`,
          willOpen: function() {
            const originalUrlEle = document.getElementById('original-url');
            originalUrlEle.innerText = originalUrl;
            originalUrlEle.href = originalUrl;

            document.getElementById('shorten-url').value = shortenUrl;

            const qrCodeImg = document.getElementById('qr-code');
            QRCode.toCanvas(qrCodeImg, shortenUrl, { width: 200, margin: 1 });

            clipboard = new ClipboardJS('#copy-button', {
              text: () => shortenUrl,
            });
          },
          didDestroy: function() {
            clipboard.destroy();
          }
        });
      } catch (e) {
        console.log(e);
        const isBug = await Swal.fire({
          icon: "error",
          title: "未知錯誤",
          text: "無法建立短網址，請確認網路連線是否正常",
          showConfirmButton: true,
          showDenyButton: true,
          confirmButtonText: "OK",
          denyButtonText: "Bug回報",
          customClass: {
            confirmButton: 'swal-confirm-button',
            denyButton: 'swal-deny-button',
          },
          buttonsStyling: false,
        });
        if (isBug.isDenied) {
          Config.reportBug();
        }
      }
    },
    async generateShortenUrl() {
      this.isGenerating = true;
      await this._generateShortenUrl();
      this.isGenerating = false;
    }
  }
}
</script>

<style lang="scss">
#app {
  height: 100vh;
}

#index {
  background-color: #333;
  box-shadow: inset 0 0 5rem rgba(0, 0, 0, .5);
  color: #ddd;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.slogan {
  color: #fff;
  margin-bottom: 0.75rem;
}

main.inner {
  margin: auto auto 18vh;
  max-width: 44rem;
  width: 100%;
}

.lead-text {
  margin-bottom: 1rem;
}

.url-form {
  align-items: stretch;
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin: 0 auto;
  max-width: 36rem;
}

.url-input {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.5rem;
  color: #111;
  flex: 1;
  font-size: 1.125rem;
  min-width: 0;
  padding: 0.9rem 1rem;
}

.url-input:focus {
  border-color: #83d19a;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.2);
  outline: none;
}

.action-button {
  border: 1px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.125rem;
  min-width: 7rem;
  padding: 0.9rem 1.4rem;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.action-button.is-ready {
  background: transparent;
  border-color: #79d38a;
  color: #79d38a;
}

.action-button.is-ready:hover {
  background: rgba(121, 211, 138, 0.12);
  color: #a6ebb3;
}

.action-button.is-loading {
  background: #0dcaf0;
  color: #0d2a33;
}

.action-button:disabled {
  cursor: wait;
}

a {
  color: #aaa;
  transition: 0.3s;

  &:hover {
    color: #eee !important;
  }

  &:visited {
    color: #aaa;
  }
}

.shorten-url-result-title {
  padding-top: 40px !important;
}

.shorten-url-result-actions {
  margin-top: 0 !important;
  justify-content: flex-end !important;
  padding: 0 30px !important;
}

.shorten-url-result-html {
  color: #111;
  margin-top: 10px;
  text-align: center;

  a {
    color: #007bff;

    &:hover {
      color: #0056b3 !important;
    }

    &:visited {
      color: #007bff;
    }
  }

  p {
    margin-bottom: 0;
  }
}

.swal2-popup {
  border-radius: 1rem;
}

.swal-input-group {
  align-items: stretch;
  display: flex;
  gap: 0.5rem;
}

.swal-input {
  border: 1px solid #cfd4dc;
  border-radius: 0.5rem;
  flex: 1;
  font-size: 1rem;
  min-width: 0;
  padding: 0.7rem 0.85rem;
}

.swal-copy-button {
  background: #0d6efd;
  border: 1px solid #0d6efd;
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.7rem 1rem;
}

.qr-wrapper {
  margin: 1rem 0;
}

.original-url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.swal-confirm-button,
.swal-deny-button {
  border: 1px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  margin: 0 0.25rem;
  min-width: 5rem;
  padding: 0.65rem 1rem;
}

.swal-confirm-button {
  background: #0d6efd;
  color: #fff;
}

.swal-deny-button {
  background: transparent;
  border-color: #ffc107;
  color: #9a7100;
}

@media (max-width: 640px) {
  main.inner {
    margin-bottom: 12vh;
  }

  .url-form {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
