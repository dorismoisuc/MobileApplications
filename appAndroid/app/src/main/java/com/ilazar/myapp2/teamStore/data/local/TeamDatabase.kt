package com.ilazar.myapp2.teamStore.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.ilazar.myapp2.teamStore.data.Team
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(entities = [Team::class], version = 1)
abstract class TeamDatabase : RoomDatabase() {

    abstract fun teamDao(): TeamDao

    companion object {
        @Volatile
        private var INSTANCE: TeamDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): TeamDatabase {
            val inst = INSTANCE
            if (inst != null) {
                return inst
            }
            val instance =
                Room.databaseBuilder(
                    context.applicationContext,
                    TeamDatabase::class.java,
                    "team_db"
                )
                    .addCallback(WordDatabaseCallback(scope))
                    .allowMainThreadQueries()
                    .build()
            INSTANCE = instance
            return instance
        }

        private class WordDatabaseCallback(private val scope: CoroutineScope) :
            RoomDatabase.Callback() {

            override fun onOpen(db: SupportSQLiteDatabase) {
                super.onOpen(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateDatabase(database.teamDao())
                    }
                }
            }
        }

        suspend fun populateDatabase(teamDao: TeamDao) {
//            teamDao.deleteAll()
//            itemDao.deleteAll()
//            val item = Item("1", "Hello")
//            itemDao.insert(item)
        }
    }

}
