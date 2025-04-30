FROM    ubuntu:22.04
RUN     apt-get update && apt-get install -y --no-install-recommends \ 
	sudo \
	libgtk-3-dev \ 
	libwebkit2gtk-4.0-dev \ 
	libappindicator3-dev \ 
	librsvg2-dev \ 
	patchelf \ 
	jq \ 
	ca-certificates \
	build-essential \
	curl \
	wget \
	file \
	libssl-dev
#
RUN	curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
RUN     apt-get install -y --no-install-recommends nodejs
#
RUN     export uid=1000 gid=1001
RUN     mkdir -p /home/docker_user
RUN     echo "docker_user:x:${uid}:${gid}:docker_user,,,:/home/docker_user:/bin/bash" >> /etc/passwd
RUN     echo "docker_user:x:${uid}:" >> /etc/group
RUN     echo "docker_user ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/docker_user
RUN     chmod 0440 /etc/sudoers.d/docker_user
RUN     chown ${uid}:${gid} -R /home/docker_user 
# 
RUN	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y
ENV	PATH="/root/.cargo/bin:${PATH}"
#
USER    docker_user 
ENV     HOME=/home/docker_user 
# 
RUN	wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
RUN	rustup default stable
#
WORKDIR	/workspace
#
CMD     [ "bash" ]
