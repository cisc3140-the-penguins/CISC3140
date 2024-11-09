<?php
header('Content-Type: application/json');
$config = require 'config.php';

function fetchApiData($url) {
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);

    $response = curl_exec($curl);
    $error = curl_error($curl);
    curl_close($curl);

    if ($error) {
        return ["error" => "cURL Error: $error"];
    }

    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ["error" => "JSON Decoding Error: " . json_last_error_msg()];
    }

    return $data;
}

$weatherUrl = "https://api.tomorrow.io/v4/weather/realtime?location=brooklyn&apikey=" . $config['tomorrow_api_key'];
$weatherData = fetchApiData($weatherUrl);

$response = [];

if (!isset($weatherData['error']) && $weatherData) {
    $latitude = $weatherData['location']['lat'] ?? null;
    $longitude = $weatherData['location']['lon'] ?? null;

    if ($latitude && $longitude) {
        $response['weather'] = $weatherData;
        // $sunriseUrl = "https://api.weather.gov/points/$latitude,$longitude";
        // $sunriseData = fetchApiData($sunriseUrl);

        // if (!isset($sunriseData['error'])) {
        //     $response['sunriseSunset'] = $sunriseData;
        // } else {
        //     $response['sunriseSunset'] = $sunriseData;
        // }
        $sunriseSunsetUrl = "https://api.sunrise-sunset.org/json?lat=$latitude&lng=$longitude&formatted=0";
        $sunriseSunsetData = fetchApiData($sunriseSunsetUrl);

        if (!isset($sunriseSunsetData['error'])) {
            $response['sunriseSunset'] = $sunriseSunsetData;
        } else {
            $response['sunriseSunset'] = $sunriseSunsetData;
        }

        $weatherConditionUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$latitude}&lon={$longitude}&appid=" . $config['openweather_api_key'];
        $weatherConditionData = fetchApiData($weatherConditionUrl);

        if (!isset($weatherConditionData['error'])) {
            $response['currentWeather'] = $weatherConditionData;
        } else {
            $response['currentWeather'] = $weatherConditionData; 
        }
    } else {
        $response['error'] = "Failed to extract latitude and longitude from weather data.";
    }
} else {
    $response = $weatherData;
}
?>
