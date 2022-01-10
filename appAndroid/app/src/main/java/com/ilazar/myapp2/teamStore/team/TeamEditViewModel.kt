package com.ilazar.myapp2.teamStore.team

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.ilazar.myapp2.core.Result
import com.ilazar.myapp2.core.TAG
import com.ilazar.myapp2.teamStore.data.Team
import com.ilazar.myapp2.teamStore.data.TeamRepository
import com.ilazar.myapp2.teamStore.data.local.TeamDatabase
import kotlinx.coroutines.launch

class TeamEditViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    private val teamRepository: TeamRepository

    init {
        val teamDao = TeamDatabase.getDatabase(application, viewModelScope).teamDao()
        teamRepository = TeamRepository(teamDao)
    }

    fun getTeamById(teamId: String): LiveData<Team> {
        Log.v(TAG, "getTeamById...")
        return teamRepository.getById(teamId)
    }

    fun saveOrUpdateTeam(team: Team) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateTeam...")
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Team>
            if (team._id.isNotEmpty()) {
                result = teamRepository.update(team)
            } else {
                result = teamRepository.save(team)
            }
            when(result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateTeam succeeded")
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateTeam failed", result.exception)
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }
}