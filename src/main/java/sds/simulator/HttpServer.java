package sds.simulator;

import static akka.http.javadsl.server.Directives.complete;
import static akka.http.javadsl.server.Directives.concat;
import static akka.http.javadsl.server.Directives.entity;
import static akka.http.javadsl.server.Directives.getFromResource;
import static akka.http.javadsl.server.Directives.path;
import static akka.http.javadsl.server.Directives.post;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.slf4j.Logger;

import akka.actor.typed.ActorSystem;
import akka.cluster.sharding.typed.javadsl.ClusterSharding;
import akka.http.javadsl.Http;
import akka.http.javadsl.marshallers.jackson.Jackson;
import akka.http.javadsl.model.ContentTypes;
import akka.http.javadsl.model.MediaTypes;
import akka.http.javadsl.model.StatusCodes;
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
        path("favicon.ico", () -> getFromResource("favicon.ico", MediaTypes.IMAGE_X_ICON.toContentType())),
        path("selection", this::handleSelectionPost)
    );
  }

  private Route handleSelectionPost() {
    return post(
      () -> entity(
            Jackson.unmarshaller(SelectionActionRequest.class),
            selectionActionRequest -> {
              try {
                log().debug("POST {}", selectionActionRequest);
                submit(selectionActionRequest);
                return complete(StatusCodes.OK, SelectionActionResponse.ok(StatusCodes.OK.intValue(), selectionActionRequest), Jackson.marshaller());
              } catch (IllegalArgumentException e) {
                log().warn("POST failed {}", selectionActionRequest);
                return complete(StatusCodes.BAD_REQUEST, SelectionActionResponse.failed(e.getMessage(), StatusCodes.BAD_REQUEST.intValue(), selectionActionRequest), Jackson.marshaller());
              }
            }
      )
    );
  }

  private void submit(SelectionActionRequest selectionActionRequest) {
  }

  public static class SelectionActionRequest implements CborSerializable {
    public final String what;
    public final String action;
    public final int amount;
    public final int rate;
    public final Location location;

    @JsonCreator
    public SelectionActionRequest(
      @JsonProperty("what") String what,
      @JsonProperty("action") String action,
      @JsonProperty("amount") int amount,
      @JsonProperty("rate") int rate,
      @JsonProperty("location") Location location) {
      this.what = what;
      this.action = action;
      this.amount = amount;
      this.rate = rate;
      this.location = location;
    }

    @Override
    public String toString() {
      return String.format("%s[%s, %s, amount %,d, rate %,d, %s]",
        getClass().getSimpleName(), what, action, amount, rate, location);
    }

    public static class Location implements CborSerializable {
      public final double radius;
      public final LatLng center;
      public final LatLng topLeft;
      public final LatLng botRight;

      @JsonCreator
      public Location(
      @JsonProperty("radius") double radius,
      @JsonProperty("center") LatLng center,
      @JsonProperty("topLeft") LatLng topLeft,
      @JsonProperty("botRight") LatLng botRight) {
        this.radius = radius;
        this.center = center;
        this.topLeft = topLeft;
        this.botRight = botRight;
      }

      @Override
      public String toString() {
        return String.format("%s[radius %,1.9f, center %s, topLeft %s, botRight %s]",
          getClass().getSimpleName(), radius, center, topLeft, botRight);
      }
    }

    public static class LatLng implements CborSerializable {
      public final double lat;
      public final double lng;

      @JsonCreator
      public LatLng(
        @JsonProperty("lat") double lat,
        @JsonProperty("lng") Double lng) {
        this.lat = lat;
        this.lng = lng;
      }

      @Override
      public String toString() {
        return String.format("%s[%1.9f, %1.9f]", getClass().getSimpleName(), lat, lng);
      }
    }
  }

  public static class SelectionActionResponse implements CborSerializable {
    public final String message;
    public final int httpStatusCode;
    public final SelectionActionRequest selectionActionRequest;

    @JsonCreator
    public SelectionActionResponse(String message, int httpStatusCode, SelectionActionRequest selectionActionRequest) {
      this.message = message;
      this.httpStatusCode = httpStatusCode;
      this.selectionActionRequest = selectionActionRequest;
    }

    public static Object ok(int httpStatusCode, SelectionActionRequest selectionActionRequest) {
      return new SelectionActionResponse("Accepted", httpStatusCode, selectionActionRequest);
    }

    public static Object failed(String message, int httpStatusCode, SelectionActionRequest selectionActionRequest) {
      return new SelectionActionResponse(message, httpStatusCode, selectionActionRequest);
    }
  }

  private Logger log() {
    return actorSystem.log();
  }
}
