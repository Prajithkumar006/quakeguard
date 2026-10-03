import 'package:flutter/material.dart';

void main() {
  runApp(const QuakeGuardApp());
}

class QuakeGuardApp extends StatelessWidget {
  const QuakeGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuakeGuard AI',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF090D16),
        primaryColor: const Color(0xFF2563EB),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2563EB),
          secondary: Color(0xFFF97316),
          error: Color(0xFFEF4444),
        ),
      ),
      home: const HomeDashboardScreen(),
    );
  }
}

class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QuakeGuard AI 2.0', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active, color: Color(0xFFF97316)),
            onPressed: () {},
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // SOS Emergency Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFEA580C)]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.redAccent, blurRadius: 10)],
              ),
              child: Column(
                children: [
                  const Text('EMERGENCY SOS PANIC BUTTON', style: TextStyle(fontSize: 18, fontWeight: FontWeight.black, color: Colors.white)),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.red),
                    onPressed: () {},
                    icon: const Icon(Icons.warning_amber),
                    label: const Text('TRIGGER SOS NOW', style: TextStyle(fontWeight: FontWeight.bold)),
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('Real-Time Seismic Activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Card(
              color: const Color(0xFF1E293B),
              child: ListTile(
                leading: const CircleAvatar(backgroundColor: Colors.orange, child: Text('6.4', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                title: const Text('M 6.4 - Ridgecrest, California'),
                subtitle: const Text('Depth: 8km | 1 hour ago'),
                trailing: const Icon(Icons.chevron_right),
              ),
            )
          ],
        ),
      ),
    );
  }
}
