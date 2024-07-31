export const watchID = navigator.geolocation.watchPosition((position) => {
    console.log(position.coords.latitude, position.coords.longitude);
    const watchID_x = position.coords.latitude;
    const watchID_y = position.coords.longitude;
    return [watchID_x, watchID_y];
});
navigator.geolocation.clearWatch(watchID);