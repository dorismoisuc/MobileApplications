package com.ilazar.myapp2.auth.data.remote

import com.ilazar.myapp2.auth.data.TokenHolder
import com.ilazar.myapp2.auth.data.User
import com.ilazar.myapp2.core.Api
import com.ilazar.myapp2.core.Result
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

object RemoteAuthDataSource {
    interface AuthService {
        @Headers("Content-Type: application/json")
        @POST("/api/auth/login")
        suspend fun login(@Body user: User): TokenHolder
    }

    private val authService: AuthService = Api.retrofit.create(AuthService::class.java)

    suspend fun login(user: User): Result<TokenHolder> {
        return try {
            Result.Success(authService.login(user))
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}

