class Address {
  region_id = ''
  region = ''
  locality = ''
  street = ''
  extended = ''

  constructor(init?: Partial<Address>) {
    Object.assign(this, init)
  }
}

let CACHE: {[yubin3: string]: {[yubin7: string]: string[]}} = {};
module YubinBango {
  export class Core {
    URL = 'https://yubinbango.github.io/yubinbango-data/data';
    REGION: Array<string | null> = [
      null, '北海道', '青森県', '岩手県', '宮城県',
      '秋田県', '山形県', '福島県', '茨城県', '栃木県',
      '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
      '新潟県', '富山県', '石川県', '福井県', '山梨県',
      '長野県', '岐阜県', '静岡県', '愛知県', '三重県',
      '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県',
      '和歌山県', '鳥取県', '島根県', '岡山県', '広島県',
      '山口県', '徳島県', '香川県', '愛媛県', '高知県',
      '福岡県', '佐賀県', '長崎県', '熊本県', '大分県',
      '宮崎県', '鹿児島県', '沖縄県'
    ];
    constructor(inputVal = '', callback?: (addr: Address) => Address) {
      if(inputVal !== ''){
        // 全角の数字を半角に変換 ハイフンが入っていても数字のみの抽出
        const a = inputVal.replace(/[０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 65248));
        const b = a.match(/\d/g);
        const c = b.join('');
        const yubin7 = this.chk7(c);
        // 7桁の数字の時のみ作動
        if (yubin7 !== '') {
          this.getAddr(yubin7, callback);
        } else {
          callback(new Address());
        }
      }
    }
    chk7(val: string) {
      if (val.length === 7) {
        return val;
      } else {
        return '';
      }
    }
    selectAddr(addr: string[]): Address {
      if (addr && addr[0] && addr[1]) {
        return new Address({
          region_id: addr[0],
          region: this.REGION[addr[0]],
          locality: addr[1],
          street: addr[2],
          extended: addr[3]
        })
      } else {
        return new Address()
      }
    }
    jsonp(url: string, fn: (addrMap: {[yubin7: string]: string[]}) => Address) {
      window['$yubin'] = (data: {[yubin7: string]: string[]}) => fn(data);
      const scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "text/javascript");
      scriptTag.setAttribute("charset", "UTF-8");
      scriptTag.setAttribute("src", url);
      document.head.appendChild(scriptTag);
    }
    getAddr(yubin7: string, fn: (addr: Address) => Address): Address {
      const yubin3 = yubin7.substr(0, 3);
      // 郵便番号上位3桁でキャッシュデータを確認
      if (yubin3 in Object.keys(CACHE) && yubin7 in Object.keys(CACHE[yubin3])) {
        return fn(this.selectAddr(CACHE[yubin3][yubin7]));
      } else {
        this.jsonp(`${this.URL}/${yubin3}.js`, (data) => {
          CACHE[yubin3] = data;
          return fn(this.selectAddr(data[yubin7]));
        });
      }
    }
  }
}

export default YubinBango