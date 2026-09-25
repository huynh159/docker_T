FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy JAR đã được đóng gói sẵn từ máy host
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]