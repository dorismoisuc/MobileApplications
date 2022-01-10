package com.ilazar.myapp2.core

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ListView
import com.ilazar.myapp2.R

class SensorsWindow : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sensors_window)

        var sensorManager: SensorManager =
            this.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        var sensorList = sensorManager.getSensorList(Sensor.TYPE_ALL)
        var lv = findViewById<ListView>(R.id.listView)

        val listItems = arrayOfNulls<String>(sensorList.size)
        for (i in 0 until sensorList.size) {
            val sensor = sensorList[i]
            listItems[i] = sensor.name
        }
        val adapter = ArrayAdapter(this, android.R.layout.simple_expandable_list_item_1, listItems)
        lv.adapter = adapter
    }
}