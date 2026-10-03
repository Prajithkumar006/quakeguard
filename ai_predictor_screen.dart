import 'package:flutter/material.dart';

class AIPredictorScreen extends StatefulWidget {
  const AIPredictorScreen({super.key});

  @override
  State<AIPredictorScreen> createState() => _AIPredictorScreenState();
}

class _AIPredictorScreenState extends State<AIPredictorScreen> {
  double riskScore = 76.0;
  String riskLevel = "HIGH SEISMIC RISK";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Risk Predictor'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.orange),
              ),
              child: Column(
                children: [
                  const Text('AI RISK INDEX', style: TextStyle(color: Colors.grey)),
                  Text(
                    '${riskScore.toInt()}/100',
                    style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.orange),
                  ),
                  Chip(
                    label: Text(riskLevel, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    backgroundColor: Colors.orange.shade800,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                minimumSize: const Size(double.infinity, 50),
              ),
              onPressed: () {},
              child: const Text('RE-RUN ML MODEL', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
