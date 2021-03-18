
# Supply and Demand Scheduler Demo Simulator Microservice

## Run Locally

Run the microservice locally using the following steps.

### Run in foreground

mvn exec:exec -DAPP_CONFIG=local1.conf

### Run in background

mvn exec:exec -DAPP_CONFIG=local1.conf &> /tmp/sds-simulator-service-1.log &

### Stop running in foreground

Stop the service with ctrl-c.

### Stop running in background

List the running background processes.

~~~bash
jobs -l
~~~

Output

~~~text
[1]  + 1742830 running    mvn exec:exec -DAPP_CONFIG=local1.conf &> /tmp/sds-simulator-service-1.log
~~~

Identify the process job number, the `[n]` at the start of each line. Then use the `kill` command to stop the process.

~~~bash
kill %n
~~~

Output

~~~text
[1]  + 1742830 exit 143   mvn exec:exec -DAPP_CONFIG=local1.conf &> /tmp/sds-simulator-service-1.log
~~~
