package com.ilazar.myapp2.teamStore.teams

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.ilazar.myapp2.R
import com.ilazar.myapp2.core.TAG
import com.ilazar.myapp2.teamStore.data.Team
import com.ilazar.myapp2.teamStore.team.TeamEditFragment

class TeamListAdapter(
    private val fragment: Fragment,
) : RecyclerView.Adapter<TeamListAdapter.ViewHolder>() {

    var teams = emptyList<Team>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    private var onTeamClick: View.OnClickListener = View.OnClickListener { view ->
        val team = view.tag as Team
        fragment.findNavController().navigate(R.id.TeamEditFragment, Bundle().apply {
            putString(TeamEditFragment.TEAM_ID, team._id)
        })
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_team, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val team = teams[position]
        holder.nameView.text = team.name
        holder.gamesPlayed.text = team.gamesPlayed.toString()
        holder.itemView.tag = team
        holder.itemView.setOnClickListener(onTeamClick)
    }

    override fun getItemCount() = teams.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val nameView: TextView = view.findViewById(R.id.name)
        val gamesPlayed: TextView = view.findViewById(R.id.gamesPlayed)

    }
}
