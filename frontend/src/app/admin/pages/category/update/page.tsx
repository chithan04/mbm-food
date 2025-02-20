import CategoryUpdate from "@/app/admin/components/category/CategoryUpdate";
import Heading from "@/app/admin/components/common/Heading";
import React from "react";

const page = () => {
  return (
    <div>
      <Heading>Cập nhật danh mục</Heading>
      <CategoryUpdate></CategoryUpdate>
    </div>
  );
};

export default page;
