import request from "@/utils/request";

// 商品列表
export function getCategoryList(params) {
  return request.get("/reserve/category", {
    params,
  });
}

// 添加 / 修改
export function addOrUpdate({ id, ...data }) {
  let method = "POST";
  let url = "/reserve/category";

  if (id > 0) {
    method = "PUT";
    url += `/${id}`;
    data.id = id;
  }

  return request({ url, method, data });
}

// 删除
export function deleteData(id) {
  return request.delete(`/reserve/category/${id}`);
}

// 获取属性
export function getCategoryRule(params) {
  return request.get("/reserve/category/rule", {
    params,
  });
}

// 添加 / 修改属性
export function addOrUpdateRule({ id, ...data }) {
  let method = "POST";
  let url = "/reserve/category/rule";

//   if (id > 0) {
//     method = "PUT";
//     url += `/${id}`;
//     data.id = id;
//   }

  return request({ url, method, data });
}
