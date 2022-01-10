package com.ilazar.myapp2.teamStore.data.remote

import com.ilazar.myapp2.core.Api
import com.ilazar.myapp2.teamStore.data.Team
import retrofit2.http.*

object TeamApi {
    interface Service {
        @GET("/api/team")
        suspend fun find(): List<Team>

        @GET("/api/team/{id}")
        suspend fun read(@Path("id") teamId: String): Team;

        @Headers("Content-Type: application/json")
        @POST("/api/team")
        suspend fun create(@Body team: Team): Team

        @Headers("Content-Type: application/json")
        @PUT("/api/team/{id}")
        suspend fun update(@Path("id") teamId: String, @Body team: Team): Team
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}