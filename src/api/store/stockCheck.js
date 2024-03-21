import request from "@/utils/request";

// 盘点记录列表
export function getList(params) {
  return request.get("/store/stock_check", {
    params,
  });
}

// 盘点商品总数
export function getCount() {
  return request.get("/store/stock_check/count");
}

// 商品库存校验
export function goodsCheck(params) {
  return request.get("/store/stock_check/check", {
    params,
  });
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = "POST";
  let url = "/store/stock_check";

  if (id > 0) {
    method = "PUT";
    url += `/${id}`;
    data.id = id;
  }

  return request({ url, method, data });
}

// 删除
export function deleteData(id) {
  return request.delete(`/store/offline/${id}`);
}
