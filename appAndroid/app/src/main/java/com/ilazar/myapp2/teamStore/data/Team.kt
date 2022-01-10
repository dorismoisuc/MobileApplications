package com.ilazar.myapp2.teamStore.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "teams")
data class Team(
    @PrimaryKey @ColumnInfo(name = "_id") var _id: String,
    @ColumnInfo(name = "name") var name: String,
    @ColumnInfo(name = "location") var location: String,
    @ColumnInfo(name = "leadership") var leadership: Boolean,
    @ColumnInfo(name = "gamesPlayed") var gamesPlayed: Int
) {
    override fun toString(): String {
        return "Team(_id='$_id', name='$name', location='$location', leadership=$leadership, gamesPlayed=$gamesPlayed)"
    }
}
