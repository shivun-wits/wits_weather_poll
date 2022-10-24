# Wits Weather Station Polling Script

## Introduction

This script polls weather.wits.ac.za periodically and can be used to create CSV files.

## Installation

NodeJS is required along with the following modules
- request
- yargs

<code>npm install request yargs</code>

## Usage

List available sensors:
<code>node wwsget.js -l</code>


Default: Poll every second for all sensor data.


Typical usage: Get Wind Speed and Direction and write to file every 5 seconds
<code>node wwsget.js -s 7,8 -p 5000 -f wind_data.csv</code>
