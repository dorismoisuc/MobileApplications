package com.ilazar.myapp2.teamStore.team
import android.R.attr
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ilazar.myapp2.core.TAG
import com.ilazar.myapp2.databinding.FragmentTeamEditBinding
import com.ilazar.myapp2.teamStore.data.Team
import android.view.animation.BounceInterpolator

import android.R.attr.button

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.ilazar.myapp2.R


class TeamEditFragment : Fragment() {
    companion object {
        const val TEAM_ID = "TEAM_ID"
    }

    private lateinit var viewModel: TeamEditViewModel
    private var teamId: String? = null
    private var team: Team? = null

    private var _binding: FragmentTeamEditBinding? = null

    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(TEAM_ID)) {
                teamId = it.getString(TEAM_ID).toString()
            }
        }
        _binding = FragmentTeamEditBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "save team")
            val i = team
            if (i != null) {
                i.name = binding.teamName.text.toString()
                i.location = binding.teamLocation.text.toString()
                i.gamesPlayed = binding.teamGamesPlayed.text.toString().toInt()
                i.leadership = binding.teamLeadership.isChecked
                viewModel.saveOrUpdateTeam(i)
            }
        }
        bounceAnimation(binding.fab)
    }

    private fun bounceAnimation(button: FloatingActionButton) {
        ObjectAnimator.ofFloat(button, "translationY", -200f, 0f).apply {
            duration = 1000 //1 sec
            interpolator = BounceInterpolator()
            repeatMode = ValueAnimator.REVERSE
            start()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(TeamEditViewModel::class.java)
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigate(R.id.action_TeamEditFragment_to_TeamListFragment)
            }
        })
        val id = teamId
        if (id == null) {
            team = Team("", "", "", false, 0)
        } else {
            viewModel.getTeamById(id).observe(viewLifecycleOwner, {
                Log.v(TAG, "update teams")
                if (it != null) {
                    team = it
                    binding.teamName.setText(it.name)
                    binding.teamLeadership.isChecked = it.leadership
                    binding.teamGamesPlayed.setText(it.gamesPlayed.toString())
                    binding.teamLocation.setText(it.location)
                }
            })
        }
    }
}