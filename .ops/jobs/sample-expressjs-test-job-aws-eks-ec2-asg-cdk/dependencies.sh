#!/bin/bash
apt-get update && apt-get -y install git npm && rm -r /var/cache/apt/archives/
apt-get update && apt-get -y install docker-compose-plugin && rm -r /var/cache/apt/archives/
apt-get update && apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin && rm -r /var/cache/apt/archives/