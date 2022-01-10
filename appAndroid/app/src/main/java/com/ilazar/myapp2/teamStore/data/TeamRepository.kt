package com.ilazar.myapp2.teamStore.data

import android.annotation.SuppressLint
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.work.*
import com.ilazar.myapp2.core.Result
import com.ilazar.myapp2.teamStore.data.local.TeamDao
import com.ilazar.myapp2.teamStore.data.remote.TeamApi

class TeamRepository(private val teamDao: TeamDao) {

    val teams = teamDao.getAll()

    suspend fun refresh(): Result<Boolean> {
        try {
            val teams = TeamApi.service.find()
            for (team in teams) {
                teamDao.insert(team)
            }
            return Result.Success(true)
        } catch(e: Exception) {
            return Result.Error(e)
        }
    }

    fun getById(teamId: String): LiveData<Team> {
        return teamDao.getById(teamId)
    }

    suspend fun save(team: Team): Result<Team> {
        return try {
            val createdTeam = TeamApi.service.create(team)
            teamDao.insert(createdTeam)
            Result.Success(createdTeam)
        } catch(e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun update(team: Team): Result<Team> {
        try {
            val updatedteam = TeamApi.service.update(team._id, team)
            teamDao.update(updatedteam)
            return Result.Success(updatedteam)
        } catch(e: Exception) {
            Log.d("edit","failed to edit on server")
            teamDao.update(team)
            Log.d("edit","edited locally id ${team._id}")
            startEditJob(team._id)
            Log.d("edit","enqueued job")
            return Result.Error(e)
        }
    }

    @SuppressLint("RestrictedApi")
    private fun startEditJob(teamId: String) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)
            .build()
        val inputData = Data.Builder()
            .put("teamId",teamId)
            .build()
        val myWork = OneTimeWorkRequest.Builder(EditWorker::class.java)
            .setConstraints(constraints)
            .setInputData(inputData)
            .build()
        WorkManager.getInstance().enqueue(myWork)
    }
}