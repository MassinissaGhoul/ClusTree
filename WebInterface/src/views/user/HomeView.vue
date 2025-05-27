<template>
  <div class="home min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    
    <!-- Header Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold">C</span>
            </div>
            <h1 class="text-xl font-bold text-gray-800">Clustree</h1>
          </div>
          
          <div class="space-x-4">
            <button class="text-gray-600 hover:text-blue-600 transition-colors">
              Se connecter
            </button>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-6xl mx-auto px-4 py-16">
    

      <!-- Main Content -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-gray-800 mb-6">
          Clustering de Camarades
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Créez automatiquement des groupes de travail optimaux basés sur les affinités entre étudiants
        </p>
        
        <div class="space-x-4">
          <button class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg">
            Commencer maintenant
          </button>
          <button class="bg-white text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors shadow-lg border">
            En savoir plus
          </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        
        <!-- Feature 1 - Students -->
        <div class="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">👨‍🎓</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">Interface Étudiant</h3>
          <p class="text-gray-600 mb-6">
            Saisissez facilement vos préférences de collaboration avec vos camarades
          </p>
          <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Tester l'interface
          </button>
        </div>

        <!-- Feature 2 - Teachers -->
        <div class="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">👨‍🏫</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">Interface Enseignant</h3>
          <p class="text-gray-600 mb-6">
            Gérez les sessions de clustering et configurez les paramètres
          </p>
          <button class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Dashboard prof
          </button>
        </div>

        <!-- Feature 3 - Algorithm -->
        <div class="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🧮</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">Algorithme C++</h3>
          <p class="text-gray-600 mb-6">
            Clustering optimisé avec calcul de score de satisfaction
          </p>
          <button class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Voir l'algo
          </button>
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="bg-white rounded-xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-center text-gray-800 mb-8">Stack Technique</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div class="space-y-2">
            <div class="text-2xl">⚡</div>
            <div class="font-medium text-gray-800">Vue.js 3</div>
            <div class="text-sm text-gray-500">Frontend</div>
          </div>
          <div class="space-y-2">
            <div class="text-2xl">🚀</div>
            <div class="font-medium text-gray-800">Node.js</div>
            <div class="text-sm text-gray-500">Backend</div>
          </div>
          <div class="space-y-2">
            <div class="text-2xl">🐘</div>
            <div class="font-medium text-gray-800">PostgreSQL</div>
            <div class="text-sm text-gray-500">Database</div>
          </div>
          <div class="space-y-2">
            <div class="text-2xl">⚙️</div>
            <div class="font-medium text-gray-800">C++</div>
            <div class="text-sm text-gray-500">Algorithme</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <p class="text-gray-300">
          © 2025 Clustree - Projet de Licence Sciences du Numérique
        </p>
      </div>
    </footer>

  </div>
</template>

<script setup>
// Page d'accueil principale de Clustree
// Ici vous pourrez ajouter la logique de navigation vers login/register
</script>