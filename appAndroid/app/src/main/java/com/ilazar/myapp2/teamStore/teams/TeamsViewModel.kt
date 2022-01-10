package com.ilazar.myapp2.teamStore.teams

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

class TeamListViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val teams: LiveData<List<Team>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    private val teamRepository: TeamRepository

    init {
        val teamDao = TeamDatabase.getDatabase(application, viewModelScope).teamDao()
        teamRepository = TeamRepository(teamDao)
        teams = teamRepository.teams
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...")
            mutableLoading.value = true
            mutableException.value = null
            when (val result = teamRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded")
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception)
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}