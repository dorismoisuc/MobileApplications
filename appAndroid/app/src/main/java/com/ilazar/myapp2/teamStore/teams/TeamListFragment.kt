package com.ilazar.myapp2.teamStore.teams

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ilazar.myapp2.R
import com.ilazar.myapp2.core.SensorsWindow
import com.ilazar.myapp2.auth.data.AuthRepository
import com.ilazar.myapp2.core.TAG
import com.ilazar.myapp2.databinding.FragmentTeamListBinding

class TeamListFragment : Fragment() {
    private var _binding: FragmentTeamListBinding? = null
    private lateinit var teamListAdapter: TeamListAdapter
    private lateinit var teamsModel: TeamListViewModel
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        Log.i(TAG, "onCreateView")
        _binding = FragmentTeamListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return
        }
        setupTeamList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "add new Team")
            findNavController().navigate(R.id.action_TeamListFragment_to_TeamEditFragment)
        }

        binding.fabSensors.setOnClickListener {
            Log.v(TAG, "show sensors")
            val intent = Intent(context, SensorsWindow::class.java)
            startActivity(intent)
        }
    }

    private fun setupTeamList() {
        teamListAdapter = TeamListAdapter(this)
        binding.teamList.adapter = teamListAdapter
        teamsModel = ViewModelProvider(this).get(TeamListViewModel::class.java)
        teamsModel.teams.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update teams")
            teamListAdapter.teams = value
        })
        teamsModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })
        teamsModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })
        teamsModel.refresh()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }
}