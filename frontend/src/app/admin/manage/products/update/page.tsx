import Heading from "@/app/admin/components/common/Heading";
import ProductUpdate from "@/app/admin/components/product/ProductUpdate";
import React from "react";

const page = () => {
  return (
    <div>
      <Heading className="mt-4">Cập nhật sản phẩm</Heading>
      <ProductUpdate></ProductUpdate>
    </div>
  );
};

export default page;
