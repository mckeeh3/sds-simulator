
# SDS Simulator Microservice

Supply and Demand Scheduler Demo Simulator Microservice

## Run Locally

Run the microservice locally using the following steps.

First, compile the code.

~~~bash
mvn compile
~~~

Or...

~~~bash
mvn clean package
~~~

### Run in foreground

~~~bash
mvn exec:exec -DAPP_CONFIG=local1.conf
~~~

### Run in background

~~~bash
mvn exec:exec -DAPP_CONFIG=local1.conf &> /tmp/sds-simulator-service-1.log &
~~~

### Check for service readiness

~~~bash
curl http://localhost:9101/ready
~~~

Output

~~~text
OK
~~~

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
