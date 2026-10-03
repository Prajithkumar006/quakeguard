import 'package:flutter/material.dart';

class LiveMapScreen extends StatelessWidget {
  const LiveMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Earthquake Map'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: Container(
        color: const Color(0xFF090D16),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.map, size: 80, color: Color(0xFF2563EB)),
              SizedBox(height: 16),
              Text(
                'USGS Real-Time Live Map Active',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              SizedBox(height: 8),
              Text(
                'Rendering safe shelters, hospitals & evacuation routes',
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
