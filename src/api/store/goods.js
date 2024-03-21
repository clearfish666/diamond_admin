import request from "@/utils/request";

// 商品列表
export function getGoodsList(params) {
  return request.get("/store/goods", {
    params,
  });
}

// 商品信息
export function goodsInfo(id) {
  return request.get(`/store/goods/${id}`);
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = "POST";
  let url = "/store/goods";

  if (id > 0) {
    method = "PUT";
    url += `/${id}`;
    data.id = id;
  }

  return request({ url, method, data });
}

// 删除
export function deleteData(id) {
  return request.delete(`/store/goods/${id}`);
}

// 出库
export function stockOut({ ...data }) {
  let url = "/store/goods/stock-out";
  let method = "POST";

  return request({ url, method, data });
}

// 重新入库
export function stockIn({ ...data }) {
  let url = "/store/goods/stock-in";
  let method = "POST";

  return request({ url, method, data });
}

// 商品信息根据IMIE
export function goodsInfoByImie({ ...data }) {
  let url = "/store/goods/goods-by-imie";
  let method = "POST";

  return request({ url, method, data });
}
