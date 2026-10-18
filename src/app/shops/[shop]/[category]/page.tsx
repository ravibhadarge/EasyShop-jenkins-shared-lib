import ProductGrid from "@/components/ProductGrid";
import SelectedFilters from "@/components/filters/SelectedFilters";
import ProductLoader from "@/components/loader/ProductLoader";
import { Suspense } from "react";

type CategoryPageProps = {
  searchParams: Promise<SearchParamsType>;
  params: Promise<{
    category: string;
    shop: string;
  }>;
};

const CategoryPage = async ({
  params,
  searchParams,
}: CategoryPageProps) => {
  const routeParams = await params;
  const queryParams = await searchParams;

  return (
    <section className="category-page">
      <SelectedFilters />
      <Suspense fallback={<ProductLoader />}>
        <ProductGrid
          searchParams={queryParams}
          params={routeParams}
        />
      </Suspense>
    </section>
  );
};

export default CategoryPage;
