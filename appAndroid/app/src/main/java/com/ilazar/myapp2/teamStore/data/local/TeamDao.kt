package com.ilazar.myapp2.teamStore.data.local

import androidx.lifecycle.LiveData
import androidx.room.*
import com.ilazar.myapp2.teamStore.data.Team

@Dao
interface TeamDao {
    @Query("SELECT * from teams ORDER BY name ASC")
    fun getAll(): LiveData<List<Team>>

    @Query("SELECT * FROM teams WHERE _id=:id ")
    fun getById(id: String): LiveData<Team>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(team: Team)

    @Update(onConflict = OnConflictStrategy.REPLACE)
    suspend fun update(team: Team)

    @Query("DELETE FROM teams")
    suspend fun deleteAll()

    @Query("SELECT Count(*) FROM teams")
    fun getSize(): Int

    @Query("SELECT * FROM teams WHERE _id=:id ")
    fun getByIdNotLiveData(id: String?): Team
}