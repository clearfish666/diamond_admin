import request from "@/utils/request";

// 商品列表
export function getGoodsList(params) {
  return request.get("/reserve/goods", {
    params,
  });
}

// 商品信息
export function goodsInfo(id) {
  return request.get(`/reserve/goods/${id}`);
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = "POST";
  let url = "/reserve/goods";

  if (id > 0) {
    method = "PUT";
    url += `/${id}`;
    data.id = id;
  }

  return request({ url, method, data });
}

// 删除
export function deleteData(id) {
  return request.delete(`/reserve/goods/${id}`);
}
