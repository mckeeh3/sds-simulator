package sds.simulator;

import static akka.http.javadsl.server.Directives.concat;
import static akka.http.javadsl.server.Directives.getFromResource;
import static akka.http.javadsl.server.Directives.path;

import org.slf4j.Logger;

import akka.actor.typed.ActorSystem;
import akka.cluster.sharding.typed.javadsl.ClusterSharding;
import akka.http.javadsl.Http;
import akka.http.javadsl.model.ContentTypes;
import akka.http.javadsl.model.MediaTypes;
import akka.http.javadsl.server.Route;

class HttpServer {
  private final ActorSystem<?> actorSystem;
  private final ClusterSharding clusterSharding;

  static void start(String host, int port, ActorSystem<?> actorSystem) {
    new HttpServer(host, port, actorSystem);
  }

  private HttpServer(String host, int port, ActorSystem<?> actorSystem) {
    this.actorSystem = actorSystem;
    clusterSharding = ClusterSharding.get(actorSystem);

    start(host, port);
  }

  private void start(String host, int port) {
    Http.get(actorSystem).newServerAt(host, port).bind(route());
    log().info("HTTP Server started on {}:{}", host, port);
  }

  private Route route() {
    return concat(
        path("", () -> getFromResource("simulator.html", ContentTypes.TEXT_HTML_UTF8)),
        path("simulator.html", () -> getFromResource("simulator.html", ContentTypes.TEXT_HTML_UTF8)),
        path("simulator.js", () -> getFromResource("simulator.js", ContentTypes.APPLICATION_JSON)),
        path("p5.js", () -> getFromResource("p5.js", ContentTypes.APPLICATION_JSON)),
        path("p5.min.js", () -> getFromResource("p5.min.js", ContentTypes.APPLICATION_JSON)),
        path("mappa.js", () -> getFromResource("mappa.js", ContentTypes.APPLICATION_JSON)),
        path("mappa.min.js", () -> getFromResource("mappa.min.js", ContentTypes.APPLICATION_JSON)),
        path("favicon.ico", () -> getFromResource("favicon.ico", MediaTypes.IMAGE_X_ICON.toContentType()))
    );
  }

  private Logger log() {
    return actorSystem.log();
  }
}
