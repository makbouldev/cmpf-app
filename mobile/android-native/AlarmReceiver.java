package com.cmpf.ambulance;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String id = intent.getStringExtra("id");
        String medicationName = intent.getStringExtra("medicationName");

        Log.d("AlarmReceiver", "Alarm received for " + medicationName);

        Intent serviceIntent = new Intent(context, AlarmService.class);
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("medicationName", medicationName);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
