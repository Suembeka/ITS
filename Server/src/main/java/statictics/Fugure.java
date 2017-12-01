/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package statictics;

import java.util.ArrayList;

/**
 *
 * @author ksinn
 */
public class Fugure {

    private ArrayList<Point> points;
    
    {
        points = new ArrayList<Point>();
    }

    public int getSize() {
        return points.size();
    }

    public Point getPoint(int i) {
        return points.get(i);
    }

    public void addPoint(long aLong, long aLong0) {
        points.add(new Point(aLong, aLong0));
    }

     class Point {

        public long point;
        public long value;
        public Point() {
        }

        public Point(long aLong, long aLong0) {
            this.point = aLong;
            this.value = aLong0;
        }

        long getPoint() {
            return point;
        }

        long getValue() {
            return value;
        }
    }
    
}
