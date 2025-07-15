#!/bin/sh
CONF=/etc/config/qpkg.conf
QPKG_NAME="qBittorrent"
QPKG_ROOT=`/sbin/getcfg $QPKG_NAME Install_Path -f ${CONF}`
APACHE_ROOT=`/sbin/getcfg SHARE_DEF defWeb -d Qweb -f /etc/config/def_share.info`
export QNAP_QPKG=$QPKG_NAME


export QPKG_ROOT
export QPKG_NAME

export SHELL=/bin/sh
export LC_ALL=en_US.UTF-8
export USER=admin
export LANG=en_US.UTF-8
export LC_CTYPE=en_US.UTF-8
export PATH=/opt/QPython3/bin:$PATH
export PYTHON=/opt/QPython3/bin/python3

export PIDF=/var/run/qBittorrent.pid
export HOME=$QPKG_ROOT

export PATH=/opt/QPython3/bin:/opt/QPython310/bin:/opt/QPython311/bin:/opt/Apache80/bin:/opt/Apache81/bin:/opt/Apache82/bin:/opt/Apache83/bin:$PATH

case "$1" in
  start)
    ENABLED=$(/sbin/getcfg $QPKG_NAME Enable -u -d FALSE -f $CONF)
    if [ "$ENABLED" != "TRUE" ]; then
        echo "$QPKG_NAME is disabled."
        exit 1
    fi

/bin/ln -sf $QPKG_ROOT /opt/$QPKG_NAME

cd $QPKG_ROOT

### Check if config already exists

if ! [ -f $HOME/.config/qBittorrent/qBittorrent.conf ];then

echo "creating default config $HOME/.config/qBittorrent/qBittorrent.conf"

mv $HOME/.config/qBittorrent/qBittorrent.conf_ori $HOME/.config/qBittorrent/qBittorrent.conf

else

echo "qBittorrent.conf exists"

fi

./qbittorrent-nox --webui-port=6363 > ${QPKG_ROOT}/first_startup.log &
echo $! > $PIDF

sleep 3

### check if password

if grep -q "not set" ${QPKG_ROOT}/first_startup.log; then

    echo "qbittorrent admin password not set"

export TEMP_PASS=$(awk '{for(i=0;i<=NF;i++) if (tolower($i)=="session:") print $(i+1)}' ${QPKG_ROOT}/first_startup.log);

#send temp pass to log

/sbin/log_tool  -t1 -uSystem -p127.0.0.1 -mlocalhost -a "[QBittorrent] the temporary password from is $TEMP_PASS"


else
    echo "qbittorrent admin password already set"
fi

    ;;

  stop)

ID=$(more /var/run/qBittorrent.pid)

        if [ -e $PIDF ]; then
            kill -9 $ID
            rm -f $PIDF
        fi

killall -9 qbittorrent-nox

rm -rf /opt/$QPKG_NAME



    ;;

  restart)
    $0 stop
    $0 start
    ;;

  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac

exit 0