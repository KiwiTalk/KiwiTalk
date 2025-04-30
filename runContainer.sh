#!/bin/bash

sudo xhost +local:docker
docker run --rm -it --env DISPLAY=$DISPLAY --volume .:/workspace --volume /tmp/.X11-unix:/tmp/.X11-unix ssh_image_tag_3
