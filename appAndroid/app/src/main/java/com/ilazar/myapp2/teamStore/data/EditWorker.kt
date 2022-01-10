package com.ilazar.myapp2.teamStore.data

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.ilazar.myapp2.teamStore.data.local.TeamDatabase
import com.ilazar.myapp2.teamStore.data.remote.TeamApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class EditWorker (
    context: Context,
    workerParams: WorkerParameters
) : Worker(context, workerParams) {
    override fun doWork(): Result {
        Log.d("EditWorker","Started")
        val teamId = inputData.getString("teamId");
        Log.d("EditWorker","teamId: $teamId")

        val teamDao = TeamDatabase.getDatabase(applicationContext, GlobalScope).teamDao()
        Log.d("EditWorker",teamDao.getSize().toString())

        val team = teamDao.getByIdNotLiveData(teamId)
        Log.d("EditWorker", "Returned team $team")
        if (team != null) {
            GlobalScope.launch (Dispatchers.Main) {
                TeamApi.service.update(team._id, team)
            }
            Log.d("EditWorker", "Edited team $team")
            return Result.success();
        }
        return Result.failure();
    }
}