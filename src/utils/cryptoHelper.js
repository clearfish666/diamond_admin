import cryptoJs from 'crypto-js'

const CryptoHelper = {
  constructor(key) {
    /**
     * 如需秘钥，可以在实例化时传入
     */
    this.key = key
  },
  /**
   * 加密
   * @param word
   */
  encrypt(word) {
    if (!word) {
      return ''
    }
    const encrypted = cryptoJs.MD5(word)
    return encrypted.toString()
  }
}

export default CryptoHelper

