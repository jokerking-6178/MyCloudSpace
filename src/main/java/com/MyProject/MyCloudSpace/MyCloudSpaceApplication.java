package com.MyProject.MyCloudSpace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MyCloudSpaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyCloudSpaceApplication.class, args);
	}

}
