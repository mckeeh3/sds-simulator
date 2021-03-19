package sds.simulator;

import akka.actor.typed.ActorSystem;
import akka.actor.typed.Behavior;
import akka.actor.typed.Terminated;
import akka.actor.typed.javadsl.Behaviors;
import akka.management.cluster.bootstrap.ClusterBootstrap;
import akka.management.javadsl.AkkaManagement;

class Main {
  static Behavior<Void> create() {
    return Behaviors.setup(
        context -> Behaviors.receive(Void.class)
            .onSignal(Terminated.class, signal -> Behaviors.stopped())
            .build()
    );
  }

  public static void main(String[] args) {
    ActorSystem<?> actorSystem = ActorSystem.create(Main.create(), "sds-simulator-service");
    startClusterBootstrap(actorSystem);
    startHttpServer(actorSystem);
  }

  private static void startClusterBootstrap(ActorSystem<?> actorSystem) {
    AkkaManagement.get(actorSystem).start();
    ClusterBootstrap.get(actorSystem).start();
  }

  static void startHttpServer(ActorSystem<?> actorSystem) {
    final var host = actorSystem.settings().config().getString("sds-simulator-service.http.host");
    final var port = actorSystem.settings().config().getInt("sds-simulator-service.http.port");

    HttpServer.start(host, port, actorSystem);
  }
}