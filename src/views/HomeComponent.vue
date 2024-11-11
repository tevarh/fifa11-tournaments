<!-- src/views/HomeComponent.vue -->
<template> 
  <div class="tournaments-content">
    <h1>{{ $t("welcomeMessage") }}</h1>
    <p>{{ $t("discordInfo") }}</p>
    <p>{{ $t("developmentInfo") }}</p>
  </div>
</template>

  
  <script>
  export default {
    name: 'HomeComponent',
  };
  </script>
  