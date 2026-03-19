package org.tonghua.app.data.repository

import org.tonghua.app.data.api.ApiMeta
import org.tonghua.app.data.api.TonghuaApi
import org.tonghua.app.data.model.Product
import org.tonghua.app.data.model.TraceabilityRecord
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for product operations.
 */
@Singleton
class ProductRepository @Inject constructor(
    private val api: TonghuaApi,
) {
    suspend fun getProducts(
        page: Int = 1,
        category: String? = null,
        sort: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null,
    ): Result<Pair<List<Product>, ApiMeta?>> {
        return try {
            val response = api.getProducts(page, category, sort, minPrice, maxPrice)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(Pair(response.body()!!.data ?: emptyList(), response.body()!!.meta))
            } else {
                Result.failure(Exception(response.body()?.error?.message ?: "Failed to load products"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProductDetail(id: String): Result<Product> {
        return try {
            val response = api.getProductDetail(id)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.body()?.error?.message ?: "Product not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTraceability(id: String): Result<List<TraceabilityRecord>> {
        return try {
            val response = api.getProductTraceability(id)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data?.records ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.error?.message ?: "Traceability not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
