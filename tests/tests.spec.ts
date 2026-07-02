import { test, expect } from "@playwright/test";
import { TAG } from "./tags";

function getRandomNumber() {
  return Math.floor(Math.random() * 100000);
}

// ============================================================================================================================
// GET products by id, by slug, using pagination, related by id, and related by slug
// ============================================================================================================================
test.describe("GET /products", { tag: [TAG.getProducts] }, () => {
  let createdProduct;
  test.beforeEach(async ({ request }) => {
    // !ARRANGE
    const uniqueTitle =
      await test.step("1. Preconditions: create a unique title", async () => {
        const uniqueTitle = "New Product" + getRandomNumber();
        return uniqueTitle;
      });

    const responseCreate =
      await test.step(`2. Create a product with ${uniqueTitle}`, async () => {
        const response = await request.post("api/v1/products/", {
          data: {
            title: uniqueTitle,
            price: 10,
            description: "A description",
            categoryId: 1,
            images: ["https://placehold.co/600x400"],
          },
          failOnStatusCode: true,
        });
        return response;
      });
    const jsonCreate = await responseCreate.json();
    createdProduct = {
      productId: jsonCreate.id,
      productSlug: jsonCreate.slug,
      json: jsonCreate,
    };
  });

  test.afterEach(async ({ request }) => {
    await test.step(`5. Delete the created product with ${createdProduct.productId}`, async () => {
      await request.delete(`/api/v1/products/${createdProduct.productId}`, {
        failOnStatusCode: true,
      });
    });
  });

  //Get a single product by ID
  test(
    "get product by id - should be succeful",
    { tag: [TAG.smoke] },
    async ({ request }) => {
      // !ACT
      const responseGet =
        await test.step(`3. Get the created product by ${createdProduct.productId}`, async () => {
          const response = await request.get(
            `/api/v1/products/${createdProduct.productId}`,
            {
              failOnStatusCode: true,
            },
          );
          return response;
        });

      // !ASSERT
      await test.step(`4. Verify that the created product was retrieved successfully by ${createdProduct.productId}`, async () => {
        const jsonGet = await responseGet.json();
        const headers = responseGet.headers();
        expect(responseGet).toBeOK();
        expect(responseGet.status()).toBe(200);
        expect(responseGet.statusText()).toBe("OK");
        expect(jsonGet).toMatchObject(createdProduct.json);
        expect(headers["content-type"]).toContain("application/json");
        expect(headers["access-control-allow-origin"]).toBe("*");
        expect(headers).toHaveProperty("date");
      });
    },
  );

  //Get a single product by slug
  test("get product by slug - should be succeful", async ({ request }) => {
    // !ACT
    const responseGet =
      await test.step(`3. Get the created product by ${createdProduct.productSlug}`, async () => {
        const response = await request.get(
          `/api/v1/products/slug/${createdProduct.productSlug}`,
          {
            failOnStatusCode: true,
          },
        );
        return response;
      });

    //!ASSERT
    await test.step(`4. Verify that the created product was retrieved successfully by ${createdProduct.productSlug}`, async () => {
      const jsonGet = await responseGet.json();
      const headers = responseGet.headers();
      expect(responseGet).toBeOK();
      expect(responseGet.status()).toBe(200);
      expect(responseGet.statusText()).toBe("OK");
      expect(jsonGet).toMatchObject(createdProduct.json);
      expect(headers["content-type"]).toContain("application/json");
      expect(headers["access-control-allow-origin"]).toBe("*");
      expect(headers).toHaveProperty("date");
    });
  });

  //Get Products related by id
  test("Get products related by id - should be successful", async ({
    request,
  }) => {
    //!ACT
    const relatedProduct =
      await test.step(`3. Get products related by ${createdProduct.productId}`, async () => {
        const response = await request.get(
          `/api/v1/products/${createdProduct.productId}/related`,
        );
        return response;
      });

    //!ASSERT
    await test.step(`4. Verify that the products related by ${createdProduct.productId} were retrieved successfully`, async () => {
      const relatedJson = await relatedProduct.json();
      expect(relatedProduct).toBeOK();
      expect(relatedProduct.status()).toBe(200);
      expect(relatedProduct.statusText()).toBe("OK");
      expect(relatedJson.length).toBeGreaterThan(0);
      expect(
        relatedJson.every((product) => product.id !== createdProduct.productId),
      ).toBeTruthy;
      expect(relatedProduct.status()).toBe(200);
      const headers = relatedProduct.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
      expect(headers["content-type"]).toContain("application/json");
      expect(headers).toHaveProperty("date");
    });
  });

  //Get Products related by slug
  test("Get products related by slug - should be successful", async ({
    request,
  }) => {
    //!ACT
    const relatedProduct =
      await test.step(`3. Get products related by ${createdProduct.productSlug}`, async () => {
        return await request.get(
          `/api/v1/products/slug/${createdProduct.productSlug}/related`,
        );
      });

    //!ASSERT
    await test.step(`4. Verify that the products related by ${createdProduct.productSlug} were retrieved successfully`, async () => {
      const relatedJson = await relatedProduct.json();
      expect(relatedProduct).toBeOK();
      expect(relatedProduct.status()).toBe(200);
      expect(relatedProduct.statusText()).toBe("OK");
      expect(relatedJson.length).toBeGreaterThan(0);
      expect(
        relatedJson.every(
          (product) => product.slug !== createdProduct.productSlug,
        ),
      ).toBeTruthy;
      expect(relatedProduct.status()).toBe(200);
      const headers = relatedProduct.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
      expect(headers["content-type"]).toContain("application/json");
      expect(headers).toHaveProperty("date");
    });
  });
});

// ============================================================================================================================
// SMOKE TESTS: create, update, and delete product
// ============================================================================================================================
test.describe("SMOKE tests", { tag: [TAG.smoke] }, () => {
  let createdProduct;
  test.beforeEach(async ({ request }) => {
    //!ARRANGE
    const uniqueTitle =
      await test.step("1. Preconditions: create a unique title", async () => {
        return "New Product" + getRandomNumber();
      });

    const responseCreate =
      await test.step("2. Create a product with ${uniqueTitle}", async () => {
        const response = await request.post("api/v1/products/", {
          data: {
            title: uniqueTitle,
            price: 10,
            description: "A description",
            categoryId: 1,
            images: ["https://placehold.co/600x400"],
          },
          failOnStatusCode: true,
        });
        return response;
      });
    const jsonCreate = await responseCreate.json();
    createdProduct = {
      productId: jsonCreate.id,
      json: jsonCreate,
      response: responseCreate,
    };
  });

  //Create a product
  test("create a product - should be successful", async ({ request }) => {
    //!ASSERT
    await test.step("3. Verify that the product was created successfully", async () => {
      const responseCreate = createdProduct.response;
      expect(responseCreate).toBeOK();
      expect(responseCreate.status()).toBe(201);
      expect(responseCreate.statusText()).toBe("Created");
      const responseGet = await request.get(
        `/api/v1/products/${createdProduct.productId}`,
        {
          failOnStatusCode: true,
        },
      );
      const jsonGet = await responseGet.json();
      expect(jsonGet).toMatchObject(createdProduct.json);
      const headers = responseCreate.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
      expect(headers["content-type"]).toContain("application/json");
      expect(headers).toHaveProperty("date");
    });
  });

  //Update product
  test("update product - should be successful", async ({ request }) => {
    //!ACT
    const updatedProduct =
      await test.step(`3. Update the created product with ${createdProduct.productId}`, async () => {
        const response = await request.put(
          `/api/v1/products/${createdProduct.productId}`,
          {
            data: {
              title: "Updated Product" + getRandomNumber(),
              price: 200,
              description: "A description",
              categoryId: 1,
              images: ["https://placehold.co/600x400"],
            },
          },
        );
        return response;
      });
    //!ASSERT
    await test.step(`4. Verify that the product with ${createdProduct.productId} was updated successfully`, async () => {
      const updatedJson = await updatedProduct.json();
      expect(updatedProduct).toBeOK();
      expect(updatedProduct.status()).toBe(200);
      expect(updatedProduct.statusText()).toBe("OK");
      const responseGet = await request.get(
        `/api/v1/products/${createdProduct.productId}`,
        {
          failOnStatusCode: true,
        },
      );
      const jsonGet = await responseGet.json();
      expect(jsonGet).toMatchObject(updatedJson);
      const headers = updatedProduct.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
      expect(headers["content-type"]).toContain("application/json");
      expect(headers).toHaveProperty("date");
    });
  });

  //Delete product
  test("delete product - should be successful", async ({ request }) => {
    //!ACT
    const responseDeleted =
      await test.step(`3. Delete the created product with ${createdProduct.productId}`, async () => {
        const response = await request.delete(
          `/api/v1/products/${createdProduct.productId}`,
        );
        return response;
      });

    //!ASSERT
    await test.step(`4. Verify that the product with ${createdProduct.productId} was deleted successfully`, async () => {
      expect(responseDeleted).toBeOK();
      expect(responseDeleted.status()).toBe(200);
      expect(responseDeleted.statusText()).toBe("OK");
      const headers = responseDeleted.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
    });
  });
});

// ============================================================================================================================
// NEGATIVE scenarios: create product without title, get deleted product, delete non-existing product
// ============================================================================================================================
test.describe("negative scenarios", { tag: [TAG.negativeScenarios] }, () => {
  let createdProduct;
  test.beforeEach(async ({ request }) => {
    //!ARRANGE
    const uniqueTitle =
      await test.step("1. Preconditions: create a unique title", async () => {
        return "New Product" + getRandomNumber();
      });

    const responseCreate =
      await test.step("2. Create a product with ${uniqueTitle}", async () => {
        const response = await request.post("api/v1/products/", {
          data: {
            title: uniqueTitle,
            price: 10,
            description: "A description",
            categoryId: 1,
            images: ["https://placehold.co/600x400"],
          },
          failOnStatusCode: true,
        });
        return response;
      });

    const jsonCreate = await responseCreate.json();
    createdProduct = {
      productId: jsonCreate.id,
    };

    const responseDeleted =
      await test.step(`3. Delete the created product with ${createdProduct.productId}`, async () => {
        return request.delete(`/api/v1/products/${createdProduct.productId}`, {
          failOnStatusCode: true,
        });
      });
  });

  test.afterEach(async ({ request }) => {
    await test.step(`5. Delete the created product with ${createdProduct.productId}`, async () => {
      await request.delete(`/api/v1/products/${createdProduct.productId}`, {
        failOnStatusCode: true,
      });
    });
  });
  //Create product without title
  test.fixme("create product without title", async ({ request, page }) => {
    test.slow();
    page.waitForTimeout(1_000);
    // !ACT
    const response =
      await test.step("3. Create a product without title", async () => {
        return request.post("/api/v1/products/", {
          data: {
            price: 10,
            description: "A description",
            categoryId: 1,
            images: ["https://placehold.co/600x400"],
          },
          failOnStatusCode: false,
        });
      });

    //!ASSERT
    await test.step("4. Verify that the response status is 400 for creating a product without title", async () => {
      expect(response.status()).toBe(400);
    });
  });
  //Get deleted product
  test("get deleted product", async ({ request }) => {
    //!ACT
    const responseGetDeletedProduct =
      await test.step(`4. Get the deleted product with ${createdProduct.productId}`, async () => {
        return request.get(`/api/v1/products/${createdProduct.productId}`, {
          failOnStatusCode: false,
        });
      });

    //!ASSERT
    await test.step(`4. Verify that the deleted product with ${createdProduct.productId} was not found`, async () => {
      expect(responseGetDeletedProduct.status()).toBe(404);
    });
  });

  // ============================================================================================================================
  //Delete non-existing product
  // ============================================================================================================================
  test("delete non-existing product", async ({ request }) => {
    //!ACT
    const responseDeleteNonExisting =
      await test.step(`4. Delete the already deleted product with ${createdProduct.productId}`, async () => {
        return request.delete(`/api/v1/products/${createdProduct.productId}`, {
          failOnStatusCode: false,
        });
      });

    //!ASSERT
    await test.step("5. Verify the response status is 404 for the already deleted product", async () => {
      expect(responseDeleteNonExisting.status()).toBe(404);
    });
  });
});

// ============================================================================================================================
//Pagination
// ============================================================================================================================
//Arrange
//Act
test(
  "pagination - it should be successful",
  { tag: [TAG.getProducts] },
  async ({ request }) => {
    //!ACT
    const response =
      await test.step("1. Get products with pagination", async () => {
        return request.get("/api/v1/products", {
          params: {
            offset: 0,
            limit: 10,
          },
        });
      });
    const json = await response.json();
    test.skip(json.length === 0, "No products found for pagination test");

    //!ASSERT
    await test.step("2. Verify that the products were retrieved successfully with pagination", async () => {
      expect(response).toBeOK();
      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe("OK");
      const headers = response.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
      expect(headers["content-type"]).toContain("application/json");
      expect(headers).toHaveProperty("date");
    });
  },
);
