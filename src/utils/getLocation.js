const watchID = navigator.geolocation.watchPosition((position) => {
    console.log(position.coords.latitude, position.coords.longitude);
    
});
navigator.geolocation.clearWatch(watchID);