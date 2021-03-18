FROM docker.io/library/adoptopenjdk:11-jre-hotspot
COPY maven /maven/
ENTRYPOINT java $JAVA_OPTS -cp '/maven/*' sds.simulator.Main
