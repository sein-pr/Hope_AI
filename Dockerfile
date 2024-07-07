# Use an official nginx image as the base image
FROM nginx:latest

# Copy the HTML file
COPY index.html /usr/share/nginx/html/index.html

# Copy the CSS files
COPY style/ /usr/share/nginx/html/style/

# Copy the JS files
COPY script/ /usr/share/nginx/html/script/

# Copy the image files
COPY assets/ /usr/share/nginx/html/assets/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
