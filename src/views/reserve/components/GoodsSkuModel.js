export default class GoodsSku {
  // 规格图
  image = '';
  // 原价
  original_price = 0;
  // 价格
  price = 0;
  // 抵扣
  deduction = 0;
  // 库存
  stock_num = 0;
  // 规格详情
  specs_properties = [];

  constructor(options = {}) {
    [
      'image',
      'original_price',
      'price',
      'deduction',
      'stock_num',
      'specs_properties'
    ].forEach(key => {
      this[key] = options[key] || this[key]
    })
  }
}
