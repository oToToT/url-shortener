<script setup>
import Footer from './components/Footer.vue';
import NavBar from './components/NavBar.vue';
import Config from './Config.js';
import axios from 'axios';
import Swal from 'sweetalert2';
import ClipboardJS from 'clipboard';
</script>

<template lang="pug">
.container-fluid.d-flex.w-100.h-100.p-3.mx-auto.flex-column#index
  NavBar
  main.inner(role='main')
    h1.slogan 讓網路世界更簡單！
    p.mb-3
      | 網址太長很難記？
      br
      | 想要一個不追蹤使用者的縮網址服務？
      br
      | 來試試
      a(:href="Config.BASE_URL") Dve.Tw
      | 吧，一個極簡的縮網址服務
    .input-group.input-group-lg
      input.form-control(type='text', placeholder='https://ototot.tw/', v-model="url")
      .input-group-append
        button.btn(:disabled="isGenerating", :class='isGenerating ? "btn-info" : "btn-outline-success"', @click='generateShortenUrl') {{ isGenerating ? '生成中' : '縮個！' }}
  Footer
</template>

<script>
export default {
  data() {
    return {
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

        await Swal.fire({
          title: '成功建立短網址',
          allowOutsideClick: false,
          customClass: {
            title: 'shorten-url-result-title',
            actions: 'shorten-url-result-actions',
          },
          html: `
          <div class="shorten-url-result-html">
            <div class="input-group">
              <input class="form-control" type="text" readonly id="shorten-url">
              <div class="input-group-append">
                <button class="btn btn-primary" id="copy-button">複製！</button>
              </div>
            </div>
            <img width="200" height="200" id="qr-code">
            <p style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap">
              原網址：
              <a id="original-url"></a>
            </p>
          </div>`,
          willOpen: function() {
            const originalUrlEle = document.getElementById('original-url');
            originalUrlEle.innerText = originalUrl;
            originalUrlEle.href = originalUrl;

            document.getElementById('shorten-url').value = shortenUrl;

            document.getElementById('qr-code').src = 
              `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chld=L|1&chl=${encodedShortenUrl}`;

            const clipboard = new ClipboardJS('#copy-button', {
              target: () => shortenUrl,
            });
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
  text-align: center;
}

.slogan {
  color: #fff;
}

main.inner {
  margin: auto;
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
</style>
