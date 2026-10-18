import ProductGrid from "@/components/ProductGrid";
import SelectedFilters from "@/components/filters/SelectedFilters";
import ProductLoader from "@/components/loader/ProductLoader";
import { Suspense } from "react";

type ShopPageProps = {
  searchParams: Promise<SearchParamsType>;
  params: Promise<{
    shop: string;
    category: string;
  }>;
};

const ShopPage = async ({
  params,
  searchParams,
}: ShopPageProps) => {
  const routeParams = await params;
  const queryParams = await searchParams;

  return (
    <section className="shop-page">
      <SelectedFilters />
      <Suspense
        key={`${queryParams?.page ?? ""}${routeParams.shop}${queryParams?.q ?? ""}`}
        fallback={<ProductLoader />}
      >
        <ProductGrid
          searchParams={queryParams}
          params={routeParams}
        />
      </Suspense>
    </section>
  );
};

export default ShopPage;
